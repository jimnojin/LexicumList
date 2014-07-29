var LexicumList = function(config) {
	var self = this;
	var $ = document.querySelector.bind(document);
	
	self.config = {
		url: '',
		list: ''
	};
	
	self.data = [];
	self.list = null;
	
	self.init = function() {
		for(var i in config) {
			if (self.config.hasOwnProperty(i)) 
				self.config[i] = config[i];
		}
	
		self.list = $(self.config.list);
		this.getJSON(this.config.url, function(data) {
			self.data = data;	
			self.createLanguageSwitch();
			self.populateList();
			$('#language').onchange();
		});
	};
	self.getJSON = function (url, successHandler, errorHandler) {
		var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
		xhr.open('get', url, true);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhr.onreadystatechange = function() {
			var status;
			var data;
			if (xhr.readyState == 4) { 
				status = xhr.status;
				if (status == 200) {
					data = JSON.parse(xhr.responseText);
					successHandler && successHandler(data);
				} else {
					errorHandler && errorHandler(status);
				}
			}
		};
		xhr.send();
	};
	self.populateList = function () {							
		self.data.forEach(function(e) {
			var li = document.createElement('li');
			li.innerHTML = '<span>' + e.Word + '</span>';
			li.classList.add('list-group-item');
			li.dataset.lang = e.Language;
			li.dataset.id = e.Id;
			li.onclick = self.itemOnClick;
			self.list.appendChild(li);
		});
	};
	self.createLanguageSwitch = function() {
		var langList = {},
			langSelect = $('#language');
			
		self.data.forEach(function(e) {
			langList[e.Language] = langList.hasOwnProperty(e.Language) ? (langList[e.Language] + 1) : 1;				
		});
		for (var lang in langList) {
			var langOpt = document.createElement('option');
			langOpt.value = lang;
			langOpt.innerHTML = lang.toUpperCase();
			langSelect.appendChild(langOpt);
		}
		self.langList = langList;
		
		langSelect.onchange = function() {
			var lang = this.value;
			$('#word-count').innerHTML = '<span class="badge">' + self.langList[lang] + '</span>';
			[].slice.call(self.list.querySelectorAll('li')).forEach(function(item) {
				if (item.dataset.lang == lang) {
					item.classList.remove('hidden');
				} else {
					item.classList.add('hidden');
				}
			});
		};					
	};
	self.getItem = function(id) {
		var item = self.data.filter(function(e) { return e.Id == id });
		return item.length == 1 ? item[0] : null;
	};				
	self.itemOnClick = function(e) {
		var selected = $('li.collapsed');
		
		if (selected)
			selected.classList.remove('collapsed');
		if(selected != this) {
			var details = this.querySelector('div.details');
			if (!details) {
				var html = document.createElement('div');
				html.classList.add('details');
				html.innerHTML = self.createDetails(this.dataset.id);
				this.appendChild(html);
			}
			
			this.classList.add('collapsed');
		}
	};
	self.createDetails = function(id) {
		var item = self.getItem(id), html = "";
		if (item) {
			
			if (item.Meaning && item.Meaning.length) {
				html += '<div class="panel meaning">';
				html += '<div class="panel-title">Meaning</div>';
				html += '<div class="panel-body">';
				html += '<ol>';
				item.Meaning
					.sort(function(a, b) { return parseInt(a.Priority) > parseInt(b.Priority) ? 1 : -1; })
					.forEach(function(m) {
					html += '<li>' + m.Word + '</li>';
				});
				html += '</ol>';
				html += '</div>';
				html += '</div>';
			}
			if (item.Definition && item.Definition.length) {
				html += '<div class="panel definition">';
				html += '<div class="panel-title">Definition</div>';
				html += '<div class="panel-body"></div>';
				html += '</div>';
			}
			if (item.Examples && item.Examples.length) {
				html += '<div class="panel examples">';
				html += '<div class="panel-title">Examples</div>';
				html += '<div class="panel-body"></div>';
				html += '</div>	';		
			}	
			html += '<span class="info">Added: ' + self.formatDate(item.Added) + '</span>';
			html += '<div class="clearfix"></div>';
		}		
		return html;
	};
	self.formatDate = function (isoDate) {
		function pad(s) { return (s < 10) ? '0' + s : s; }
		var d = new Date(isoDate);
		return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('.');
	}
	
	self.init();
};			