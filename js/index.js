// DOM簡略化
(function(global, document){
    global.$id = HTMLElement.prototype.$id = function(id){
        var context = this == window ? document : this;
        return context.getElementById(id);
    };
    global.$cls = HTMLElement.prototype.$cls = function(className){
        var context = this == window ? document : this;
        return context.getElementsByClassName(className);
    };
    global.$tag = HTMLElement.prototype.$tag = function(tagName){
        var context = this == window ? document : this;
        return context.getElementsByTagName(tagName);
    };
}(this, this.document));


// 初期化用関数
(function(global, document){
    var request = global.superagent;

    /**
     * ローディング画像を作る
     */
    var Loading = function(){
        var self = this;
        var img = document.createElement('img');
        var span = document.createElement('span');
        img.setAttribute('src', 'img/loading.gif');
        this.resetCount = function(){
            this.count = 0;
        };
        this.countUp = function(){
            self.count += 1;
            span.innerHTML = ' ' + self.count + ' sec';
        };
        this.enable = function(){
            this.resetCount();
            this.interval = setInterval(this.countUp, 1000);
            this.element.style.display = 'inline';
        }
        this.disable = function(){
            this.resetCount();
            if (this.interval) {
                clearInterval(this.interval);
            }
            this.element.style.display = 'none';
        }
        this.element = document.createElement('div');
        this.element.appendChild(img);
        this.element.appendChild(span);
        this.disable();
    };

    /**
     * formのsubmitを一度無効化し、Ajaxを使って情報を取得するように設定する
     */
    var setAjaxPost = function(className, callback){
        var forms = $cls(className);
        var len = forms.length;
        var i = 0;
        var j = 0;
        var form = null;

        for (i = 0; i < len; i = i + 1) {
            form = forms[i];
            form.onsubmit = function(){
                var self = this;
                self.options = {};
                for (j = 0; j < self.elements.length; j = j + 1) {
                    self.options[self.elements[j].name] = self.elements[j].value;
                    if (self.elements[j].type == 'submit') {
                        self.button = self.elements[j];
                    }
                }
                // POST実行
                request.post(self.action).type('form').send(self.options).end(function(err, res){
                    if (err) {
                        alert(err);
                    }
                    // Content-TypeがHTMLの場合再読み込み
                    if (res && res.type == 'text/html') {
                        document.documentElement.innerHTML = new DOMParser(
                            ).parseFromString(res.text, res.type).documentElement.innerHTML;
                        init();
                    } else {
                        // HTML以外は想定外、JSONなどが必要になったら追加実装
                        console.log(res);
                    }
                    self.button.style.display = 'inline';
                    self.loading.disable();
                });
                self.button.style.display = 'none';
                self.loading.enable();
                // falseを返して同期submitを無効化
                return false;
            };
            form.loading = new Loading();
            form.insertBefore(form.loading.element, form.button);
        }
    };

    /**
     * 初期化に必要な処理まとめ
     */
    var init = function(){
        setAjaxPost('ajax_post');
    };

    init();

}(this, this.document))
