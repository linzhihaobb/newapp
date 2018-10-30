
var productDetail = Vue.extend({
    name: 'product-detail',
    props: ['productdtl', 'product'],
    template: ['<div>', '<span>{{productdtl.content}}</span>', '<div class="content" :model="productdtl">', '<div id="post_slider" style="margin-top: 60px;">', '<ul>', '<li v-for="(item,index) in productdtl.imgList" :style="item.style"></li>', '</ul>', '</div>', '<div id="projectwrap4" class="fw">', '<div id="projectinfo4">', '<div id="projectih4">', '<div class="header">', '<div class="title-warp">', '<p class="title">{{productdtl.title}}</p>', '<p class="subtitle">{{productdtl.subTitle}}</p>', '</div>', '</div>', '</div>', '<div class="clear"></div>', '</div>', '<div id="projectbody4">', '<div class="postbody4 postbody">', '<span v-html="productdtl.content"></span>', '</div>', '</div>', '<div id="projectshow4">', '<div id="projecttags4">', '<a v-for="(otherItem,index) in productdtl.otherList" v-bind:href="otherItem.link">{{otherItem.label}}</a>', '</div>', '<div id="projectib4">', '<product-list :product="product"></product-list>', '</div>', '</div>', '<div class="clear"></div>', '</div>', '</div>', '</div>'].join('')
});
Vue.component('productDetail', productDetail);