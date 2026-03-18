FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Install a simple static file server
RUN npm install -g serve

# Start the server on the port provided by Cloud Run
CMD serve -s dist -p $PORT
