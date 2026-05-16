package com.blindbox.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_item_def")
public class ItemDef {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long seriesId;
    private String name;
    private String thumbnailUrl;
    private Integer sortOrder;
    private Integer status;
    private LocalDateTime createdAt;
}
