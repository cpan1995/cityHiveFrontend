# SMS Messenger

A real-time SMS messaging application built with Angular frontend and Ruby on Rails backend, integrated with Twilio for SMS delivery and ActionCable for WebSocket communications.

## Features

- 📱 Send SMS messages via Twilio
- 🔄 Real-time status updates (pending, sent, delivered, failed)
- 🔌 WebSocket integration for live updates
- 🔐 User authentication with JWT
- 📊 Message history and status tracking

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **Angular CLI** (`npm install -g @angular/cli`)
- **Ruby** (v3.0 or higher)
- **Rails** (v7.0 or higher)
- **MongoDB** (for database)
- **Twilio Account** (for SMS functionality)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sms-messenger
```

### 2. Environment Configuration

**Create a `.env` file in the root directory** and add your configuration:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ngrok URL (update this after starting ngrok)
NGROK_URL=https://your-ngrok-url.ngrok-free.app
```

### 3. Backend Setup (Rails)

```bash
# Install Ruby dependencies
bundle install

# Start Rails server
rails server
```

The backend will run on `http://localhost:3000`

### 4. Frontend Setup (Angular)

```bash
# Navigate to frontend directory (if separate)
# cd frontend

# Install Node dependencies
npm install

# Start Angular development server
ng serve
```

The frontend will run on `http://localhost:4200`

### 5. ngrok Setup for Webhooks

Twilio webhooks require a public URL to send status updates. Use ngrok to expose your local Rails server:

#### Install ngrok

**Option 1: Download from website**
- Go to https://ngrok.com/download
- Download and extract the executable
- Sign up for a free account and get your auth token

**Option 2: Install via npm**
```bash
npm install -g ngrok
```

#### Configure ngrok

```bash
# Authenticate with your token
ngrok authtoken YOUR_AUTH_TOKEN

# Expose port 3000 (where Rails is running)
ngrok http 3000
```

#### Update Environment

After starting ngrok, you'll see output like:
```
Forwarding  https://abc123-def456.ngrok-free.app -> http://localhost:3000
```

**Update your `.env` file** with the ngrok URL:
```env
NGROK_URL=https://abc123-def456.ngrok-free.app
```

**Restart your Rails server** after updating the environment file.

## Usage

1. **Start the backend**: `rails server`
2. **Start ngrok**: `ngrok http 3000`
3. **Update .env** with your ngrok URL
4. **Restart Rails server**
5. **Start the frontend**: `ng serve`
6. **Open browser**: Navigate to `http://localhost:4200`

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### SMS
- `GET /api/v1/sms` - Get message history
- `POST /api/v1/sms` - Send new SMS message

### Webhooks
- `POST /api/v1/webhooks/twilio/status` - Twilio status callback

## WebSocket Channels

- `SmsStatusChannel` - Real-time SMS status updates

## Development Notes

### Real-time Updates Flow

1. User sends SMS via Angular frontend
2. Rails backend calls Twilio API
3. Twilio sends status updates to webhook endpoint
4. Rails broadcasts updates via ActionCable
5. Angular receives real-time updates via WebSocket

### Debugging

- **Rails logs**: `tail -f log/development.log`
- **ngrok requests**: Check ngrok terminal for incoming webhook calls
- **WebSocket**: Use Chrome DevTools > Network > WS to monitor connections

## Troubleshooting

### Common Issues

**ngrok URL not working**
- Make sure ngrok is running and URL is updated in `.env`
- Restart Rails server after changing environment variables

**WebSocket not connecting**
- Verify ActionCable is mounted at `/cable` in routes
- Check browser console for connection errors

**SMS not sending**
- Verify Twilio credentials in `.env`
- Check Rails logs for Twilio API errors
- Ensure phone numbers are in E.164 format (+1234567890)

**Webhook 500 errors**
- Check Rails logs for specific error messages
- Verify webhook controller exists and routes are correct

## Production Deployment

For production deployment:

1. Replace ngrok with a proper domain
2. Set up SSL certificates
3. Configure production database
4. Set environment variables on your hosting platform
5. Update CORS settings if needed

## Tech Stack

- **Frontend**: Angular 17+, TypeScript, RxJS
- **Backend**: Ruby on Rails 7+, MongoDB (Mongoid)
- **Real-time**: ActionCable (WebSockets)
- **SMS**: Twilio API
- **Authentication**: JWT tokens
- **Development**: ngrok for webhook testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.