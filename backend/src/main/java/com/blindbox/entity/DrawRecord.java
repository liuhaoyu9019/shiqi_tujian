package com.blindbox.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_draw_record")
public class DrawRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String drawNo;
    private Long userId;
    private Long seriesId;
    private Long itemId;
    private String itemName;
    private Integer rarity;
    private Long price;
    private Integer isFirstGet;
    private LocalDateTime createdAt;
}
