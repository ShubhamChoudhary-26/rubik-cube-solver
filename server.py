from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import subprocess


class Server(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        print("POST request received:", self.path)

        # Read request body
        content_length = int(self.headers["Content-Length"])
        body = self.rfile.read(content_length)

        # Convert JSON body into Python object
        data = json.loads(body)

        # Get shuffle depth sent by dashboard
        shuffle_depth = data["shuffleDepth"]

        print("Requested shuffle depth:", shuffle_depth)

        # Run C++ solver
        result = subprocess.run(
            [r".\build\rubiks_cube_solver.exe", str(shuffle_depth)],
            capture_output=True,
             text=True
        )

        # Print C++ logs in terminal
        print("C++ output:")
        print(result.stdout)

        # Handle C++ errors
        if result.returncode != 0:
            print("C++ error:")
            print(result.stderr)

            response = {
                "status": "error",
                "message": result.stderr
            }

            self.send_response(500)

        else:
            response = {
                "status": "success",
                "output": result.stdout
            }

            self.send_response(200)

        # CORS headers
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        # Send response back to dashboard
        self.wfile.write(
            json.dumps(response).encode()
        )


server = HTTPServer(("localhost", 8080), Server)

print("Server running on http://localhost:8080")

server.serve_forever()     