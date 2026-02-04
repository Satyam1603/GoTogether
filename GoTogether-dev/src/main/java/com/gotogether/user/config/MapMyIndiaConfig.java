package com.gotogether.user.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapMyIndiaConfig {
    
    @Value("${mapmyindia.api.key:YOUR_API_KEY_HERE}")
    private String apiKey;
    
    @Value("${mapmyindia.api.base-url:https://api.mapmyindia.com}")
    private String baseUrl;
    
    public String getApiKey() {
        return apiKey;
    }
    
    public String getBaseUrl() {
        return baseUrl;
    }
}
