package org.example.repository;

import org.example.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// @desc handles retrieval of data from mongoDB
@Repository
public interface UserRepository extends MongoRepository<User, String> {
    // @desc jdk8 handles null pointer exception
    Optional<User> findUserByEmail(String email);
}
