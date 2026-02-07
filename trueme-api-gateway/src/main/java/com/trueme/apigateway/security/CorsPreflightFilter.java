package com.trueme.apigateway.security;

import java.util.Set;

import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

/**
 * Handles CORS preflight (OPTIONS) requests early, before route matching.
 * This ensures that browser preflight requests get the correct CORS headers
 * and don't try to match routes that don't exist for OPTIONS method.
 */
@Component
public class CorsPreflightFilter implements GlobalFilter, Ordered {

    // Allowed origins - keep in sync with application.properties and CorsResponseFilter
    private static final Set<String> ALLOWED_ORIGINS = Set.of(
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3000/",
        "http://localhost:3001/"
    );

    private static final String ALLOWED_METHODS = "GET,POST,PUT,DELETE,OPTIONS,PATCH";
    private static final String ALLOWED_HEADERS = "Content-Type,Authorization,X-Requested-With,Accept,Origin";
    private static final String MAX_AGE = "3600";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        ServerHttpResponse response = exchange.getResponse();
        String origin = request.getHeaders().getFirst(HttpHeaders.ORIGIN);

        // Handle preflight (OPTIONS) requests
        if (HttpMethod.OPTIONS.equals(request.getMethod())) {
            return handlePreflightRequest(response, origin);
        }

        // For non-OPTIONS requests, add CORS headers and continue
        if (origin != null && isAllowedOrigin(origin)) {
            HttpHeaders headers = response.getHeaders();
            headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
            headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
            headers.add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Type,Authorization");
        }

        return chain.filter(exchange);
    }

    /**
     * Handles preflight OPTIONS requests by returning 200 OK with CORS headers
     */
    private Mono<Void> handlePreflightRequest(ServerHttpResponse response, String origin) {
        if (origin == null || !isAllowedOrigin(origin)) {
            // If origin not allowed, just return 200 without CORS headers (browser will reject)
            response.setStatusCode(HttpStatus.OK);
            return response.setComplete();
        }

        HttpHeaders headers = response.getHeaders();
        headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
        headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, ALLOWED_METHODS);
        headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, ALLOWED_HEADERS);
        headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
        headers.add(HttpHeaders.ACCESS_CONTROL_MAX_AGE, MAX_AGE);

        response.setStatusCode(HttpStatus.OK);
        return response.setComplete();
    }

    /**
     * Checks if the origin is in the allowed list (with and without trailing slash)
     */
    private boolean isAllowedOrigin(String origin) {
        if (origin == null) return false;
        // Check both with and without trailing slash
        return ALLOWED_ORIGINS.contains(origin) || 
               ALLOWED_ORIGINS.contains(origin + "/") ||
               ALLOWED_ORIGINS.contains(origin.replaceAll("/$", ""));
    }

    @Override
    public int getOrder() {
        // Run very early (before routing and other filters)
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
