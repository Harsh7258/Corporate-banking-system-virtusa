package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CropBankingSystemBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(CropBankingSystemBackendApplication.class, args);
        System.out.println("CropBankingSystemBackendApplication backends server started at port: 8888");
    }
}
