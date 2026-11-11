from server import Handler


class handler(Handler):
    def do_GET(self):
        self.path = _at(self.path, "/api/bookings")
        super().do_GET()

    def do_POST(self):
        self.path = _at(self.path, "/api/bookings")
        super().do_POST()


def _at(path, route):
    query = ""
    if "?" in path:
        path, query = path.split("?", 1)
        query = "?" + query
    if path.rstrip("/") in ("", "/"):
        return route + query
    return path + query
