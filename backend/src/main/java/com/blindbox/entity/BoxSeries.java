package com.blindbox.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_box_series")
public class BoxSeries {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String coverUrl;
    private String description;
    private Long price;
    private Integer totalItems;
    private Integer status;
    private Integer sortOrder;
    private Integer isHot;
    private Integer isNew;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
