package com.jnjd.registration.service;

import com.jnjd.registration.exception.RateLimitException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import io.lettuce.core.codec.RedisCodec;
import io.lettuce.core.codec.StringCodec;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.function.Supplier;

@Service
@Slf4j
public class RateLimitService {

    @Value("${app.rate-limit.registration.capacity:5}")
    private long capacity;

    @Value("${app.rate-limit.registration.refill-minutes:10}")
    private long refillMinutes;

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    private ProxyManager<String> proxyManager;

    @PostConstruct
    public void init() {
        RedisClient redisClient = RedisClient.create("redis://" + redisHost + ":" + redisPort);
        StatefulRedisConnection<String, byte[]> connection = redisClient.connect(
            RedisCodec.of(StringCodec.UTF8, ByteArrayCodec.INSTANCE)
        );
        proxyManager = LettuceBasedProxyManager.builderFor(connection)
            .build();
        log.info("Rate limiting initialized: {} requests per {} minutes", capacity, refillMinutes);
    }

    public void checkRateLimit(String ip) {
        // Bucket4j 8.x uses Bandwidth.classic() or the builder pattern correctly
        Supplier<BucketConfiguration> configSupplier = () -> BucketConfiguration.builder()
            .addLimit(Bandwidth.classic(
                capacity,
                io.github.bucket4j.Refill.greedy(capacity, Duration.ofMinutes(refillMinutes))
            ))
            .build();

        Bucket bucket = proxyManager.builder().build("rate_limit:registration:" + ip, configSupplier);

        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded for IP: {}", ip);
            throw new RateLimitException(
                "Too many registration attempts. Please try again in " + refillMinutes + " minutes."
            );
        }
    }
}
