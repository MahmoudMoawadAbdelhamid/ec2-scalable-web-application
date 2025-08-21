#!/bin/bash

# Update system and install httpd
yum update -y
yum install -y httpd

# Start and enable Apache
systemctl start httpd
systemctl enable httpd

# Write sample HTML page using DB_HOST env var
cat <<EOF > /var/www/html/index.html
<html>
  <head><title>Web App</title></head>
  <body>
    <h1>Hello from EC2 Web App</h1>
    <p>Connected to DB Host: \$DB_HOST</p>
  </body>
</html>
EOF
