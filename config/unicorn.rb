working_directory File.expand_path("../..", __FILE__)
worker_processes 5
listen "/tmp/unicorn.sock"
timeout 30
pid "/tmp/unicorn_xhoppe.pid"
stdout_path "/data/xhoppe/log/unicorn.log"
stderr_path "/data/xhoppe/log/unicorn.log"
