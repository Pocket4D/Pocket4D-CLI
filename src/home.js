/** home */

Page({
	/**
	 * 页面数据
	 */
	data: {
		list: [],
	},

	/**
	 * 页面加载时触发。一个页面只会调用一次，可以在 onLoad 的参数中获取打开当前页面路径中的参数。
	 */
	onLoad(e) {
		p4d.setNavigationBarTitle({
			title: 'douban Python系列丛书',
		});
		p4d.showLoading({});
		this.doRequest(true);
	},

	doRequest(isOnload) {
		let that = this;
		p4d.request({
			url: 'http://47.107.46.220:10808/query', //'https://douban.uieee.com/v2/book/search?q=python',
			data: {},
			header: {},
			method: 'get',
			success: function (response) {
				that.setData({
					list: response.body.books,
				});
				p4d.showToast({
					title: '加载成功',
				});
			},
			fail: function (error) {
				console.log('request error:' + JSON.stringify(error));
				p4d.showToast({
					title: '加载失败',
				});
			},
			complete: function () {
				console.log(`request complete: isOnload ${isOnload}`);
				if (isOnload) {
					// conosle.log('hideLoading');
					p4d.hideLoading();
				} else {
					// conosle.log('stopPullDownRefresh');
					p4d.stopPullDownRefresh();
				}
			},
		});
	},

	onItemClick(e) {
		console.log(`onClick!`);
		console.log(JSON.stringify(e));
		var item = this.data.list[e.target.dataset.index];
		p4d.navigateTo({
			url: 'detail?item=' + JSON.stringify(item),
		});
	},

	onPullDownRefresh() {
		console.log('onPullDownRefresh');
		this.doRequest(false);
	},

	/**
	 * 页面卸载时触发。如p4d.redirectTo或p4d.navigateBack到其他页面时。
	 */
	onUnload() {},
});
