import bbCodeParser from 'js-bbcode-parser';
import "./style.css";

"use strict";

// スライドショー用
var swiper = new Swiper('.swiper', {
	slidesPerView: 1.5,
	centeredSlides: true,
	spaceBetween: 40,
	autoplay: {
		delay: 3000,
		stopOnLastSlide: false,
		disableOnInteraction: false,
		reverseDirection: false
	},
});

new Vue({
	el: "#app",
	data: {
		gameName: "",
		gameNames: [],
		newsItems: [],
		isActive: false,
		newsResuestResult: '',
	},
	methods: {
		//
		// header 内の ゲーム検索バーを表示させる
		//
		openSearchBox: function(event) {
			this.isActive = true
		},

		// header 内の ゲーム検索バーを非表示にする
		closeSearchBox: function(event) {
			this.isActive = false
		},

		// ゲーム検索バーに入力された文字から ゲームを検索する
		searchGame: function(event) {
			// 日本語入力中のEnterキー操作は無効にする
			if (event.keyCode !== 13) return;

			// 自前のサーバー側に要求
			const url = 'http://localhost:8000/api/games/names'
			const args = {
				data: { name: this.gameName },
				headers: { "Content-Type": "application/json" }
			}

			axios
			  .get(url, { params: { name: this.gameName } } )
			  .then(x => {
					this.gameNames = x.data
				})
		},

		// ゲーム名から、関連するニュースを取得する
		getNews: function(event) {
			this.gameName = event.target.textContent

			// 自前のサーバーに要求する
			const url = `http://localhost:8000/api/games/${this.gameName}/news`
			const args = {
				headers: { "Content-Type": "application/json" }
			}

			axios
			  .get(url)
			  .then(x => {
					x.data.forEach( (news) => {
						// レスポンスの .contents はhtml形式で応答される
						// feedname: "steam_community_announcements"の場合、BBCodeのためhtmlに変換する
						if (news.feedname == "steam_community_announcements") {

							// 文字列{STEAM_CLAN_IMAGE} は以下のurlに置換する
							const clan_img_url = "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clans/"

							// 文字列[list][*]... は bbCodeParserライブラリで置換できないので、手動で変更
							news.contents = news.contents.replace(/\[list\]\s*\[\*\]/g, "<ul><li>");
							news.contents = news.contents.replace(/\[\/list\]/g, "</li></ul>");
							news.contents = news.contents.replace(/\[\*\]/g, "</li><li>");

							news.contents = news.contents.replace(/{STEAM_CLAN_IMAGE}/g, clan_img_url);
							// 文字列[previewyoutube... は bbCodeParserライブラリで置換できないので、手動で変更
							news.contents = news.contents.replace(/\[previewyoutube=(.*)\]\[\/previewyoutube\]/g, '<div class="gamenews-video"><iframe width="335" height="190" src="https://www.youtube.com/embed/$1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>');

							// ライブラリで変換
							news.contents = bbCodeParser.parse(news.contents)
						}
					})

					// ニュース取得した結果、ニュース件数が0の場合、変数にメッセージを格納
					if (x.data.length == 0) {
						this.newsResuestResult = 'ニュースはありません';
					} else {
						this.newsResuestResult = '';
					}
					this.newsItems = x.data
				})
		}
	}
});



