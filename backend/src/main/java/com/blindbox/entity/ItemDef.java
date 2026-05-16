package com.blindbox.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("t_item_def")
public class ItemDef {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long seriesId;
    private String name;
    private String modelUrl;
    private String thumbnailUrl;
    private Integer rarity;
    private BigDecimal probability;
    private Integer sortOrder;
    private Integer status;
    private LocalDateTime createdAt;
}
