package com.gotogether.user.aws;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import jakarta.annotation.PostConstruct;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import java.net.URI;
import java.time.Instant;
import java.util.UUID;

@Service
public class S3Service {

    private final S3Properties props;
    private final Environment env;
    private S3Client s3;

    @Autowired
    public S3Service(S3Properties props, Environment env) {
        this.props = props;
        this.env = env;
    }
    
    @PostConstruct
    private void initializeS3Client() {
        System.out.println("DEBUG: S3Service initializing...");
        System.out.println("DEBUG: bucket = " + props.getBucket());
        System.out.println("DEBUG: region = " + props.getRegion());
        
        // Get credentials from Environment (which reads from application.properties)
        String accessKeyId = env.getProperty("aws.access.key-id");
        String secretAccessKey = env.getProperty("aws.secret.access-key");
        
        System.out.println("DEBUG: accessKeyId from env = " + (accessKeyId != null ? "***" + accessKeyId.substring(Math.max(0, accessKeyId.length()-4)) : "null"));
        System.out.println("DEBUG: secretAccessKey from env = " + (secretAccessKey != null ? "***" : "null"));
        
        // Create credentials provider
        AwsCredentialsProvider creds = createCredentialsProvider(accessKeyId, secretAccessKey);
        
        var builder = S3Client.builder()
                .credentialsProvider(creds);
        
        if (props.getRegion() != null && !props.getRegion().isEmpty()) {
            builder.region(Region.of(props.getRegion()));
        }
        if (props.getEndpoint() != null && !props.getEndpoint().isEmpty()) {
            builder.endpointOverride(URI.create(props.getEndpoint()));
        }
        this.s3 = builder.build();
        System.out.println("DEBUG: S3Client initialized successfully");
    }
    
    /**
     * Creates credentials provider prioritizing application.properties values
     */
    private AwsCredentialsProvider createCredentialsProvider(String accessKeyId, String secretAccessKey) {
        // If credentials are provided in properties, use them
        if (accessKeyId != null && !accessKeyId.trim().isEmpty() && 
            secretAccessKey != null && !secretAccessKey.trim().isEmpty()) {
            System.out.println("DEBUG: Using credentials from application.properties");
            AwsBasicCredentials credentials = AwsBasicCredentials.create(
                accessKeyId.trim(), 
                secretAccessKey.trim()
            );
            return StaticCredentialsProvider.create(credentials);
        }
        
        // Check environment variables as fallback
        String envKeyId = System.getenv("AWS_ACCESS_KEY_ID");
        String envSecretKey = System.getenv("AWS_SECRET_ACCESS_KEY");
        if (envKeyId != null && !envKeyId.isEmpty() && envSecretKey != null && !envSecretKey.isEmpty()) {
            System.out.println("DEBUG: Using credentials from environment variables");
            AwsBasicCredentials credentials = AwsBasicCredentials.create(envKeyId, envSecretKey);
            return StaticCredentialsProvider.create(credentials);
        }
        
        // Otherwise use default provider chain (system properties, IAM role, etc.)
        System.out.println("DEBUG: Using default AWS credentials provider chain");
        return DefaultCredentialsProvider.create();
    }

    /**
     * Upload bytes to S3 and return a public URL (assuming bucket policy allows public read).
     * Object key is generated as users/{uuid}-{timestamp}.
     */
    public String uploadBytes(byte[] data, String originalFilename, String contentType) {
        String key = "users/" + UUID.randomUUID() + "-" + Instant.now().toEpochMilli() + "-" + (originalFilename == null ? "file" : originalFilename.replaceAll("[^a-zA-Z0-9._-]","_"));

        PutObjectRequest.Builder por = PutObjectRequest.builder()
                .bucket(props.getBucket())
                .key(key);
        if (contentType != null) {
            por.contentType(contentType);
        }

        PutObjectRequest request = por.build();
        PutObjectResponse response = s3.putObject(request, RequestBody.fromBytes(data));

        // Construct URL: if endpoint is set, use it; otherwise use standard S3 URL
        if (props.getEndpoint() != null && !props.getEndpoint().isEmpty()) {
            // endpoint likely includes scheme://host:port
            String ep = props.getEndpoint();
            if (ep.endsWith("/")) ep = ep.substring(0, ep.length() - 1);
            return ep + "/" + props.getBucket() + "/" + key;
        }
        // default S3 URL format: https://{bucket}.s3.{region}.amazonaws.com/{key}
        if (props.getRegion() != null && !props.getRegion().isEmpty()) {
            return "https://" + props.getBucket() + ".s3." + props.getRegion() + ".amazonaws.com/" + key;
        }
        return "https://" + props.getBucket() + ".s3.amazonaws.com/" + key;
    }
}
