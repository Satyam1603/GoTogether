package com.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
public class ServiceRegistryProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServiceRegistryProjectApplication.class, args);
	}

}
