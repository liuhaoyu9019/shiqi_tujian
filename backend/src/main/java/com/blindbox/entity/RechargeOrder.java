package com.blindbox.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_recharge_order")
public class RechargeOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private Long userId;
    private Long packageId;
    private Long amount;
    private Long bonus;
    private Long totalAmount;
    private Integer status; // 1待支付 2已支付 3已取消
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
