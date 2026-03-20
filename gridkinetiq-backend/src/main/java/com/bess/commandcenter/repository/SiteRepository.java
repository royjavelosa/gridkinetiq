package com.bess.commandcenter.repository;

import com.bess.commandcenter.domain.Site;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteRepository extends MongoRepository<Site, String> {
    List<Site> findByStatus(Site.SiteStatus status);
    List<Site> findByDispatchState(Site.DispatchState dispatchState);
}
