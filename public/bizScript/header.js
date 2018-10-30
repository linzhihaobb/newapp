var menuItem = Vue.extend({
    name: "menu-item",
    props: {
        item: {},
        index: 0
    },
    template: ['<li v-if="item.type===0" class="navitem">', '<a class="nav-a" :class="{active:(item.active)}" :href="item.href" :target="item.targer"><span :data-title="item.name">{{item.name}}</span>', '<i v-if="item.list" class="fa fa-angle-down"></i>', "</a>", '<ul id="nav" class="subnav" v-if="item.type===0">', '<menu-item :item="item" :index="index" v-for="(item, index) in item.list"></menu-item>', "</ul>", "</li>", "<li v-else>", '<a class="nav-a" :class="{active:(item.active)}" :href="item.href" :target="item.targer"><span :data-title="item.name">{{item.name}}</span>', '<i v-if="item.list" class="fa fa-angle-down"></i>', "</a>", '<ul id="nav" class="subnav" v-if="item.type===0">', '<menu-item :item="item" :index="index" v-for="(item, index) in item.list"></menu-item>', "</ul>", "</li>"].join("")
});
Vue.component("menuItem", menuItem);