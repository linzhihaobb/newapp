const h = {
    template: '#home'
}
const a = {
    template: '#add'
}
const d = {
    template: '#delete'
}
const p = {
    template: '#product'
}


var routes = [

    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        component: h,
        children: [
            //     // home的嵌套路由1 news
            {
                path: '/home/add',
                component: a,
                //         children:[
                //             {path:'detail:id',name:'detail',component:D}
                //         ]
            },
            //     // home嵌套路由2：
            {
                path: '/home/delete',
                component: d
            }
        ]
    },
    {
        path: '/product',
        component: p,

    }

]

const route = new VueRouter({
    routes: routes
})

// console.log(productList)
// var strHtml = ''
// productList.forEach(function(item,index){
//     strHtml += ` <tr>
//     <td>${item.title}</td>
//     <td>${item.title}</td>
//     <td>${item.title}</td>
//     <td>${item.title}</td>
//     <td>${item.title}</td>
// </tr>`
// });
// console.log(strHtml)
// var product = document.getElementById('insert')
// console.log(product)


