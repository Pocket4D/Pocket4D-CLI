Page({
	/**
	 * 页面数据
	 */
	data: {
		colors: ['red', 'green', 'blue'],
		backgroundColors: ['white', 'gray', '#eeeeee'],
		count: 0,
		random: 0,
	},
	setNavigationBarTitle() {
		this.data.count++;
		p4d.setNavigationBarTitle({
			title: '设置标题' + this.data.count,
		});
	},
	setNavigationBarColor() {
		// let random = Math.ceil(Math.random() * 3);
		// console.log('random = ' + random);
		this.data.random++;
		if (this.data.random > 2) {
			this.data.random = 0;
		}
		let color = this.data.colors[this.data.random];
		p4d.setNavigationBarColor({
			backgroundColor: color,
		});
	},
	setBackgroundColor() {
		this.data.random++;
		if (this.data.random > 2) {
			this.data.random = 0;
		}
		let color = this.data.backgroundColors[this.data.random];
		p4d.setBackgroundColor({
			backgroundColor: color,
		});
	},
	showToast() {
		p4d.showToast({
			title: "I'm toast!",
		});
	},
	showLoading() {
		p4d.showLoading({});
		var timerId = setTimeout(
			function (...args) {
				console.log(JSON.stringify(...args));
				p4d.hideLoading();
			},
			3000,
			'1',
			'2'
		);
		console.log('timerId = ' + timerId);
	},
	startPullDownRefresh() {
		p4d.startPullDownRefresh();
	},
	onclick() {
		// let name = "cms"
		// let width = this.data.width + 0.1;
		// let height = this.data.height + 0.1;
		// let random = Math.ceil(Math.random() * 3);
		// console.log('random = ' + random);
		// let btnColor = this.data.colors[random];
		// this.setData({ name, width, height, btnColor });
		// let that = this;
		// p4d.request({
		//     url: 'https://www.easy-mock.com/mock/5ab46236e1c17b3b2cc55843/example/items',
		//     data: {},
		//     header: {},
		//     method: 'get',
		//     success: function (response) {
		//         console.log('request success:' + JSON.stringify(response));
		//         that.setData({
		//             list: response.body.payload
		//         });
		//     },
		//     fail: function (error) {
		//         console.log('request error:' + JSON.stringify(error));
		//     },
		//     complete: function () {
		//         console.log('request complete');
		//     }
		// });
	},
	/**
	 * 页面加载时触发。一个页面只会调用一次，可以在 onLoad 的参数中获取打开当前页面路径中的参数。
	 */
	onLoad(e) {},

	onPullDownRefresh() {
		console.log('onPullDownRefresh');
		setTimeout(function () {
			p4d.stopPullDownRefresh();
		}, 3000);
	},

	/**
	 * 页面卸载时触发。如p4d.redirectTo或p4d.navigateBack到其他页面时。
	 */
	onUnload() {},
});
