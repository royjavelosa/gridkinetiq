package com.bess.commandcenter.repository;

import com.bess.commandcenter.domain.Command;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommandRepository extends MongoRepository<Command, String> {
    List<Command> findBySiteIdOrderByIssuedAtDesc(String siteId);
    List<Command> findBySiteIdAndStatusOrderByIssuedAtDesc(String siteId, Command.CommandStatus status);
    List<Command> findTop20ByOrderByIssuedAtDesc();
}
