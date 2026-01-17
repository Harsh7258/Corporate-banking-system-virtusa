package org.example.repository;

import org.example.model.client.ClientOn;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ClientRepository extends MongoRepository<ClientOn, String> {
    List<ClientOn> findByRmId(String rmId);

    Optional<ClientOn> findByIdAndRmId(String id, String rmId);
    List<ClientOn> findByRmIdAndCompanyNameContainingIgnoreCase(String rmId, String companyName);
    List<ClientOn> findByRmIdAndIndustryIgnoreCase(String rmId, String industry);

    // @desc filter the distinct industries
    @Query("{ 'rmId': ?0 }")
    @Aggregation(pipeline = {
            "{ $match: { rmId: ?0 } }",
            "{ $group: { _id: '$industry' } }",
            "{ $project: { industry: '$_id', _id: 0 } }"
    })
    List<String> findDistinctIndustriesByRmId(String rmId);
}
