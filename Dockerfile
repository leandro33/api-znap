FROM node:20-alpine AS deps
WORKDIR /api-znap
COPY package*.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /api-znap
ENV NODE_ENV=production
COPY --from=deps /api-znap/node_modules ./node_modules
COPY --from=build /api-znap/dist ./dist
EXPOSE 3000
CMD ["node","dist/server.js"]