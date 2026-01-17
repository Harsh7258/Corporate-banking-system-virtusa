package org.example.repository;

import org.example.model.credit.Credit;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CreditRepository extends MongoRepository<Credit, String> {
    List<Credit> findBySubmittedBy(String submittedBy);
}
