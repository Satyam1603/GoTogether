package com.gotogether.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * AWS S3 Configuration
 * 
 * Add to application.properties:
 * aws.access-key-id=YOUR_KEY
 * aws.secret-access-key=YOUR_SECRET
 * aws.region=us-east-1
 * aws.s3.bucket-name=your-bucket-name
 * aws.s3.base-url=https://your-bucket-name.s3.amazonaws.com
 */
@Configuration
public class AmazonS3Config {
    
    @Value("${aws.access-key-id}")
    private String accessKey;
    
    @Value("${aws.secret-access-key}")
    private String secretKey;
    
    @Value("${aws.region}")
    private String region;
    
    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .build();
    }
}
