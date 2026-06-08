FROM ruby:3.3-alpine

WORKDIR /app

RUN apk add --no-cache build-base git

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 4000

CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--port", "4000", "--livereload", "--force_polling"]
