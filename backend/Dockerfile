 FROM node:16.15.0-alpine3.15 AS development
 WORKDIR /usr/src/app
 COPY package*.json ./
 RUN npm install
 COPY . .
 RUN npm run build
 FROM node:16.15.0-alpine3.15 AS production
 ARG NODE_ENV=production
 ENV NODE_ENV=${NODE_ENV}
 ENV PORT=3005
 ENV DATA_BASE_INTANCE=10.173.216.12\\SQLUAT003
 ENV DATA_BASE_NAME=F2P_GLOBAL
 ENV DATA_BASE_USER=secSocMxsys
 ENV DATA_BASE_PASSWORD=Abc..123
 ENV DATA_BASE_INTANCE_NAME=SQLUAT003
 ENV APPLICATION_NAME=originacion-mx
 WORKDIR /usr/src/app
 COPY package*.json ./
 RUN npm install --only=production --omit=dev
 COPY --from=development /usr/src/app/dist ./dist
 EXPOSE 3005
 CMD ["npm", "run", "start:solicitud"]
