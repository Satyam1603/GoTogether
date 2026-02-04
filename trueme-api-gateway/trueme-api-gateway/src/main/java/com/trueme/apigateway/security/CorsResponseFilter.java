package com.trueme.apigateway.security;

import java.util.Set;

import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

/**
 * Normalizes CORS response headers to prevent duplicate Access-Control-Allow-Origin values.
 * Works in conjunction with CorsPreflightFilter which handles OPTIONS requests.
 * This filter runs after the response is generated to clean up any duplicate headers
 * that may have been added by downstream services.
 */
@Component
public class CorsResponseFilter implements GlobalFilter, Ordered {

    // Allowed origins - keep in sync with application.properties and CorsPreflightFilter
    private static final Set<String> ALLOWED_ORIGINS = Set.of(
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3000/",
        "http://localhost:3001/"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String origin = request.getHeaders().getFirst(HttpHeaders.ORIGIN);

        ServerHttpResponse response = exchange.getResponse();

        // Register a beforeCommit callback to normalize CORS headers before sending response
        response.beforeCommit(() -> {
            if (origin != null && isAllowedOrigin(origin)) {
                var headers = response.getHeaders();
                // If there are multiple Access-Control-Allow-Origin values, clean them up
                if (headers.containsKey(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN)) {
                    headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
                }
                // Set exactly one allowed origin value
                headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
                
                // Ensure other CORS headers are present
                if (!headers.containsKey(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS)) {
                    headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
                }
                if (!headers.containsKey(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS)) {
                    headers.add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Type,Authorization");
                }
            }
            return Mono.empty();
        });

        return chain.filter(exchange);
    }

    /**
     * Checks if the origin is in the allowed list (handles variations with/without trailing slash)
     */
    private boolean isAllowedOrigin(String origin) {
        if (origin == null) return false;
        return ALLOWED_ORIGINS.contains(origin) || 
               ALLOWED_ORIGINS.contains(origin + "/") ||
               ALLOWED_ORIGINS.contains(origin.replaceAll("/$", ""));
    }

    @Override
    public int getOrder() {
        // run late (but after preflight filter) so downstream modifications have happened
        return Ordered.LOWEST_PRECEDENCE;
    }
}
