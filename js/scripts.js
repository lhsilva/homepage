var utils = (function () {
    buildNewsFeeder = function (articles) {
        var articles, newsFeederHtml, article, articleColumn;

        if (articles) {
            newsFeederHtml = '<div class="row">';

            for (var i = 0, n = articles.length; i < n; i++) {
                article = articles[i];

                if (article && article.title && article.summary && article.url) {
                    articleColumn = buildArticleColumn(article.title, article.summary, article.url);

                    if (articleColumn) {
                        newsFeederHtml += articleColumn;
                    }
                }
            }

            newsFeederHtml += '</div>';
        }

        document.getElementById('news-feeder').innerHTML = newsFeederHtml;
    },

    buildCommitsTable = function (events) {
        var htmlTable = '<table class="table text-left"><thead><tr><th>#</th><th>Push Date and Time</th><th>Repository</th><th>Commit Message</th></tr></thead><tbody>',
            nrOfCommits = 10,
            counter = 1;

        for (var i = 0, n = events.length; i < n && counter <= nrOfCommits; i++) {
            var event = events[i];

            // Other events include Creation, Watch and so on.
            if (event && event.type === "PushEvent" && event.actor.login === "lhsilva") {
                var tableEntry = createTableRow(event, counter);

                if (tableEntry) {
                    htmlTable += tableEntry;
                    counter++;
                }
            }
        }

        htmlTable += '</tbody></table>';

        document.getElementById('commits-table').innerHTML = htmlTable;
    },

    retrieveFeedzillaArticles = function (query, order, count, callback, scope) {
        var url = "http://api.feedzilla.com/v1/categories/15/articles/search.json?q=startup&order=date&count=3",
            httpRequest, response;

        if (query && order && count) {
            url = 'http://api.feedzilla.com/v1/categories/15/articles/search.json?q=' + query + '&order=' + order + '&count=' + count;
        }

        try {
            httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = function () {
                if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                    response = JSON.parse(httpRequest.responseText);
                    if (response.articles) {
                        callback.call(scope, response.articles);
                    }
                }
            };

            httpRequest.open("GET", url, true);
            httpRequest.send(null);
        } catch (ex) {
            console.log("Error while creating a request to " + url);
        }
    },

    buildArticleColumn = function (title, summary, url) {
        if (title && summary && url) {
            return '<div class="col-md-4"><h3><a href="' + url + '" target="_blank">' + title + '</a></h3>' + '<p class="text-justify">' + summary + '</p></div>';
        }
    },

    createTableRow = function (event, counter) {
        var creationDate = new Date(event.created_at),
            eventCreationDate = creationDate.toLocaleDateString(),
            eventCreationTime = creationDate.toLocaleTimeString(),
            eventRepo = event.repo,
            eventRepoName = eventRepo.name,
            eventCommit = event.payload.commits[0],
            eventCommitSha = eventCommit.sha,
            eventCommitMsg = eventCommit.message,
            htmlTableRow = '<tr>';

        htmlTableRow += '<td>' + counter + '</td>';
        htmlTableRow += '<td>' + eventCreationDate + ' - ' + eventCreationTime + '</td>';
        htmlTableRow += '<td><a href="https://github.com/' + eventRepoName + '" target="_blank">' + eventRepoName + '</a></td>';
        htmlTableRow += '<td><a href="https://github.com/' + eventRepoName + '/commit/' + eventCommitSha + '" target="_blank">' + eventCommitMsg + '</a></td>';
        htmlTableRow += '</tr>';

        return htmlTableRow;
    },

    //latest 90 days github public repos events
    retrieveGithubLatestEvents = function (callback, scope) {
        var url = "https://api.github.com/users/lhsilva/events/public",
            events = [],
            httpRequest;

        try {
            httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = function () {
                if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                    events = JSON.parse(httpRequest.responseText);
                    callback.call(scope, events);
                }
            };

            httpRequest.open("GET", url, true);
            httpRequest.send(null);
        } catch (ex) {
            console.log("Error while creating a request to " + url);
        }
    };

    return {
        fillNewsFeeder: function (query, date, count) {
            retrieveFeedzillaArticles(query, date, count, buildNewsFeeder, this);
        },

        fillCommitsTable: function () {
            retrieveGithubLatestEvents(buildCommitsTable, this);
        }
    };
}());