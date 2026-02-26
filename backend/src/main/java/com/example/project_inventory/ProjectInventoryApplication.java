package com.example.project_inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProjectInventoryApplication {
	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(ProjectInventoryApplication.class);
		app.addInitializers(new DotenvInitializer());
		app.run(args);
	}
}
