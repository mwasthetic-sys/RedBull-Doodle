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

# Replace placeholder with actual runtime environment variable and start server
CMD find dist/assets -type f -name "*.js" -exec sed -i "s|__GEMINI_API_KEY__|${GEMINI_API_KEY}|g" {} + && serve -s dist -p $PORT
