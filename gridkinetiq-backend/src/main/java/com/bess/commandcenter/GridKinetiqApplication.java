package com.bess.commandcenter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GridKinetiqApplication {
    public static void main(String[] args) {
        SpringApplication.run(GridKinetiqApplication.class, args);
    }
}
