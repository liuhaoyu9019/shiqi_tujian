package com.blindbox.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blindbox.entity.RechargeOrder;
import com.blindbox.mapper.RechargeOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final RechargeOrderMapper rechargeOrderMapper;
    private final StringRedisTemplate redisTemplate;

    // 充值套餐（分）
    public static final List<Map<String, Object>> PACKAGES = List.of(
        Map.of("id", 1, "amount", 1000, "bonus", 0, "label", "¥10.00", "desc", "10元套餐"),
        Map.of("id", 2, "amount", 3000, "bonus", 300, "label", "¥30.00", "desc", "加赠3元"),
        Map.of("id", 3, "amount", 5000, "bonus", 800, "label", "¥50.00", "desc", "加赠8元"),
        Map.of("id", 4, "amount", 10000, "bonus", 2000, "label", "¥100.00", "desc", "加赠20元"),
        Map.of("id", 5, "amount", 30000, "bonus", 9000, "label", "¥300.00", "desc", "加赠90元"),
        Map.of("id", 6, "amount", 50000, "bonus", 20000, "label", "¥500.00", "desc", "加赠200元")
    );

    public List<Map<String, Object>> getPackages() {
        return PACKAGES;
    }

    // 创建充值订单
    @Transactional
    public RechargeOrder createOrder(Long userId, Integer packageId) {
        var pkg = PACKAGES.stream()
            .filter(p -> p.get("id").equals(packageId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("套餐不存在"));

        RechargeOrder order = new RechargeOrder();
        order.setOrderNo("RC" + IdUtil.fastSimpleUUID().substring(0, 12).toUpperCase());
        order.setUserId(userId);
        order.setPackageId(packageId.longValue());
        order.setAmount(((Number) pkg.get("amount")).longValue());
        order.setBonus(((Number) pkg.get("bonus")).longValue());
        order.setTotalAmount(order.getAmount() + order.getBonus());
        order.setStatus(1);
        order.setCreatedAt(LocalDateTime.now());

        rechargeOrderMapper.insert(order);
        return order;
    }

    // 模拟支付（生产环境对接微信/支付宝回调）
    @Transactional
    public RechargeOrder payOrder(String orderNo) {
        RechargeOrder order = rechargeOrderMapper.selectOne(
            new LambdaQueryWrapper<RechargeOrder>()
                .eq(RechargeOrder::getOrderNo, orderNo)
        );
        if (order == null) throw new RuntimeException("订单不存在");
        if (order.getStatus() != 1) throw new RuntimeException("订单状态异常");

        order.setStatus(2);
        order.setPaidAt(LocalDateTime.now());
        rechargeOrderMapper.updateById(order);

        // 写入Redis用户余额（生产环境用lua脚本原子操作）
        String balanceKey = "wallet:balance:" + order.getUserId();
        redisTemplate.opsForValue().increment(balanceKey, order.getTotalAmount());

        return order;
    }

    // 充值记录分页
    public Page<RechargeOrder> listOrders(Long userId, int page, int size) {
        Page<RechargeOrder> pg = new Page<>(page, size);
        return rechargeOrderMapper.selectPage(pg,
            new LambdaQueryWrapper<RechargeOrder>()
                .eq(userId != null, RechargeOrder::getUserId, userId)
                .orderByDesc(RechargeOrder::getCreatedAt)
        );
    }
}
