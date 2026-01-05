import socket

def get_free_port():
    s = socket.socket()
    s.bind(("", 0))
    port = s.getsockname()[1]
    s.close()
    return port

if __name__ == "__main__":
    print(get_free_port())
