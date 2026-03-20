package com.bess.commandcenter.repository;

import com.bess.commandcenter.domain.Device;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceRepository extends MongoRepository<Device, String> {
    List<Device> findBySiteId(String siteId);
    List<Device> findBySiteIdAndType(String siteId, Device.DeviceType type);
}
