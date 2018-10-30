function removeSlideshow(id) {
    if(confirm('确定要删除本张图片吗？')) {
        $.post({
            url:'/delete/' + id,
            data:null,
            // 成功时的回调函数
            success:function(data) {
                if(data.code == 'success') {
                    // 重新载入当前文档
                    // reload()方法用于刷新当前文档。
                    // reload() 方法类似于你浏览器上的刷新页面按钮。
                    location.reload();
                }else {
                    alert('删除用户失败')
                }
            }
        })
    }
}
function removeProduct(id) {
    if(confirm('确定要删除本条信息吗？')) {
        $.post({
            url:'/delete/product/' + id,
            data:null,
            // 成功时的回调函数
            success:function(data) {
                if(data.code == 'success') {
                    // 重新载入当前文档
                    // reload()方法用于刷新当前文档。
                    // reload() 方法类似于你浏览器上的刷新页面按钮。
                    location.reload();
                }else {
                    alert('删除用户失败')
                }
            }
        })
    }
}



