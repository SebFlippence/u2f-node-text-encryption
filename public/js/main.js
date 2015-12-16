/* Get a registration request from the server, use it to register the key, send the results back
 * to server and check if it was successful
 */
function register() {
    var data = {
        'filename': document.getElementById('filename').value,
        'password': document.getElementById('encryptPassword').value,
        'content': document.getElementById('content').value
    };

    ajaxPost("/api/register_request", data, function(authRequest) {
        var req = JSON.parse(authRequest);
        $('#myModal .modal-body').html('<img src="public/img/key.png"> Press your key');
        $('#myModal').modal();
        u2f.register([req], [], function(res) {
            data.u2fAuthRequest = res;
            ajaxPost("/api/register", data, function(res) {
                if (res === "true") {
                    alert("Successfully registered that key.");
                    location.reload(true);
                } else {
                    alert(res);
                }
            });
        });
    });
}

/* Get an authentication request from the server,
 * sign it with the key, verify the results on the server
 */
function authenticate(filename) {
    var data = {
        'filename': filename,
        'password': document.getElementById('decryptPassword').value
    };

    ajaxPost("/api/sign_request", data, function(authRequest) {
        var req = JSON.parse(authRequest);
        $('#myModal .modal-body').html('<img src="public/img/key.png"> Press your key');
        $('#myModal').modal();
        u2f.sign([req], function(res) {
            data.u2fAuthRequest = res;
            ajaxPost("/api/authenticate", data, function(res) {
                var modelText = '';
                try {
                    res = JSON.parse(res);
                    if (res.error) {
                        modelText = res.error;
                        return;
                    } else {
                        modelText = JSON.stringify(res.content, true, 5);
                    }
                } catch (e) {
                    modelText = res;
                }
                $('#myModal .modal-body').text(modelText);
                $('#myModal').modal();
            });
        });
    });
}

/* Very basic ajax functions */
function ajaxPost(url, data, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onload = function() {
        cb(xhr.responseText);
    };
    xhr.send(JSON.stringify(data));
}

$(function () {
    $.material.init();
});
