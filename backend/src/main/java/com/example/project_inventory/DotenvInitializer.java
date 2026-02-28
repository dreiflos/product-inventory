package com.example.project_inventory;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

public class DotenvInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext context) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        Map<String, Object> properties = new HashMap<>();
        dotenv.entries().forEach(e -> properties.put(e.getKey(), e.getValue()));
        context.getEnvironment().getPropertySources()
                .addFirst(new MapPropertySource("dotenvProperties", properties));
    }
}
