function retrieveCommitsTable() {
	var html = '<table class="table text-left">';
	html += '<thead><tr><th>#</th><th>Push Date and Time</th><th>Repository</th><th>Commit Message</th></tr></thead>';
	html += '<tbody>';

	var counter = 1;
	var events = retrieveLatestEvents();

	for (var i = 0; i < events.length && counter <= 10; i++) {

		var event = events[i];

		// Other events include Creation, Watch and so on.
		if (event.type === "PushEvent" && event.actor.login === "lhsilva") {
			var creationDate = new Date(event.created_at);
			var eventCreationDate = creationDate.toLocaleDateString();
			var eventCreationTime = creationDate.toLocaleTimeString();

			var eventRepo = event.repo;
			var eventRepoName = eventRepo.name;
			var eventCommit = event.payload.commits[0];
			var eventCommitSha = eventCommit.sha;
			var eventCommitMsg = eventCommit.message;

			html += '<tr>';
			html += '<td>' + counter + '</td>';
			html += '<td>' + eventCreationDate + ' - ' + eventCreationTime
					+ '</td>';
			html += '<td><a href="https://github.com/' + eventRepoName
					+ '" target="_blank">' + eventRepoName + '</a></td>';
			html += '<td><a href="https://github.com/' + eventRepoName
					+ '/commit/' + eventCommitSha + '" target="_blank">'
					+ eventCommitMsg + '</a></td>';
			html += '</tr>';

			counter++;
		}
	}

	html += '</tbody>';
	html += '</table>';

	return html;
}

function retrieveNewsFeederColumns() {
	var html = '<div class="row">';

	var articles = retrieveArticles();

	for (var i = 0; i < articles.length; i++) {

		var article = articles[i];

		var articleTitle = article.title;
		var articleSummary = article.summary;
		var articleUrl = article.url;

		html += '<div class="col-md-4"><h3><a href="' + articleUrl
				+ '" target="_blank">' + articleTitle + '</a></h3>';
		html += '<p class="text-justify">' + articleSummary + '</p></div>';

	}

	html += '</div>';
	return html;

}

function retrieveArticles() {
	try {
		var url = "http://api.feedzilla.com/v1/categories/15/articles/search.json?q=startup&order=date&count=3";
		var httpRequest = createXMLHttpRequestFor(url);
		var news = [];

		if (httpRequest.status === 200 && httpRequest.readyState === 4) {
			news = JSON.parse(httpRequest.responseText);
		}

		return news.articles;
	} catch (exception) {
		return null;
	}

}

function retrieveLatestEvents() {
	try {
		var url = "https://api.github.com/users/lhsilva/events/public";
		var httpRequest = createXMLHttpRequestFor(url);
		var events = [];

		if (httpRequest.status === 200 && httpRequest.readyState === 4) {
			events = JSON.parse(httpRequest.responseText);
		}

		return events;
	} catch (exception) {
		return null;
	}
}

/**
 * Does a GET for the specified URL.
 */
function createXMLHttpRequestFor(url) {
	var httpRequest = new XMLHttpRequest();
	httpRequest.open("GET", url, false);
	httpRequest.send(null);

	return httpRequest;
}