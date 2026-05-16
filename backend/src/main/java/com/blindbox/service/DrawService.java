package com.blindbox.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blindbox.entity.*;
import com.blindbox.mapper.DrawRecordMapper;
import com.blindbox.mapper.ItemDefMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class DrawService {

    private final DrawRecordMapper drawRecordMapper;
    private final ItemDefMapper itemDefMapper;
    private final StringRedisTemplate redisTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    // 执行抽盒
    @Transactional
    public DrawRecord executeDraw(Long userId, Long seriesId, Long price) {
        // 防重锁 — 在事务外获取，确保锁粒度合理
        String lockKey = "lock:draw:" + userId;
        Boolean locked = redisTemplate.opsForValue()
            .setIfAbsent(lockKey, "1", 5, TimeUnit.SECONDS);
        if (!Boolean.TRUE.equals(locked)) {
            throw new RuntimeException("操作太频繁，请稍后再试");
        }

        try {
            // 加载藏品概率池
            List<ItemDef> pool = itemDefMapper.selectList(
                new LambdaQueryWrapper<ItemDef>()
                    .eq(ItemDef::getSeriesId, seriesId)
                    .eq(ItemDef::getStatus, 1)
            );

            if (pool.isEmpty()) {
                throw new RuntimeException("该系列暂无可抽藏品");
            }

            // 加权随机
            double totalWeight = pool.stream()
                .mapToDouble(i -> i.getProbability().doubleValue())
                .sum();
            double rand = secureRandom.nextDouble() * totalWeight;

            double cursor = 0;
            ItemDef hit = pool.get(pool.size() - 1);
            for (ItemDef item : pool) {
                cursor += item.getProbability().doubleValue();
                if (rand <= cursor) {
                    hit = item;
                    break;
                }
            }

            // 写入记录 — 使用UUID保证唯一性
            DrawRecord record = new DrawRecord();
            record.setDrawNo("DB" + IdUtil.fastSimpleUUID().substring(0, 12).toUpperCase());
            record.setUserId(userId);
            record.setSeriesId(seriesId);
            record.setItemId(hit.getId());
            record.setItemName(hit.getName());
            record.setRarity(hit.getRarity());
            record.setPrice(price);
            record.setIsFirstGet(0);
            record.setCreatedAt(LocalDateTime.now());

            drawRecordMapper.insert(record);

            // 锁在事务提交后释放，防止事务回滚时并发问题
            return record;

        } catch (Exception e) {
            throw e; // 事务回滚 + 锁释放
        } finally {
            // 延迟释放锁，确保事务提交完成
            try {
                Thread.sleep(100);
            } catch (InterruptedException ignored) {}
            redisTemplate.delete(lockKey);
        }
    }
}
