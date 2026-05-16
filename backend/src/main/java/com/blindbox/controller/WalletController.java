package com.blindbox.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blindbox.common.Result;
import com.blindbox.entity.RechargeOrder;
import com.blindbox.service.WalletService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    // 充值套餐列表
    @GetMapping("/packages")
    public Result<List<Map<String, Object>>> getPackages() {
        return Result.ok(walletService.getPackages());
    }

    // 创建充值订单
    @PostMapping("/recharge")
    public Result<RechargeOrder> recharge(
            @RequestHeader("X-User-Id") @NotNull Long userId,
            @RequestParam @NotNull Integer packageId) {
        RechargeOrder order = walletService.createOrder(userId, packageId);
        return Result.ok(order);
    }

    // 模拟支付（生产环境替换为支付回调）
    @PostMapping("/pay/{orderNo}")
    public Result<RechargeOrder> pay(@PathVariable String orderNo) {
        RechargeOrder order = walletService.payOrder(orderNo);
        return Result.ok(order);
    }

    // 充值记录
    @GetMapping("/orders")
    public Result<Page<RechargeOrder>> listOrders(
            @RequestHeader("X-User-Id") @NotNull Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.ok(walletService.listOrders(userId, page, size));
    }

    // 后台：全部充值记录
    @GetMapping("/admin/orders")
    public Result<Page<RechargeOrder>> adminListOrders(
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.ok(walletService.listOrders(userId, page, size));
    }
}
