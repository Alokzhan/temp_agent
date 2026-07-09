# TempSynth API Documentation

## Overview

TempSynth is a synthetic data generation API built with Express.js and Node.js. It generates realistic temperature data with statistical analysis and trends.

## Base URL

- **Development**: `http://localhost:8080`
- **Production**: `https://tempsynth-api.onrender.com` (after deployment)

## API Endpoints

### Health Check

**Check if API is running**

```bash
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-07-09T13:10:00Z"
}
```

---

### Generate Synthetic Data

**Generate synthetic temperature data with agent logs**

```bash
POST /api/tempsynth/generate
```

**Request Body:**
```json
{
  "days": 30,
  "region": "North America",
  "seed": 12345
}
```

**Response:**
```json
{
  "data": [
    {
      "date": "2024-06-09",
      "min_temp": 18.5,
      "max_temp": 28.3,
      "avg_temp": 23.4
    }
  ],
  "logs": [
    {
      "agent": "temperature_generator",
      "status": "success",
      "message": "Generated 30 days of temperature data",
      "duration_ms": 145
    }
  ],
  "summary": {
    "total_records": 30,
    "processing_time_ms": 245,
    "success": true
  }
}
```

---

## Request/Response Format

### Common Headers

```
Content-Type: application/json
Accept: application/json
```

### Error Responses

All errors follow standard HTTP status codes:

**400 Bad Request**
```json
{
  "error": "Invalid request",
  "message": "Missing required field: days",
  "code": "VALIDATION_ERROR"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "code": "INTERNAL_ERROR"
}
```

---

## Integration Examples

### JavaScript/Node.js

```typescript
const API_URL = process.env.VITE_API_URL || 'http://localhost:8080';

async function generateData(days: number) {
  const response = await fetch(`${API_URL}/api/tempsynth/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      days,
      region: 'North America',
    }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
```

### React with TanStack Query

```typescript
import { useMutation } from '@tanstack/react-query';

function useGenerateData() {
  return useMutation({
    mutationFn: async (days: number) => {
      const response = await fetch(`${API_URL}/api/tempsynth/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days, region: 'North America' }),
      });
      return response.json();
    },
  });
}

// Usage in component
function DataGenerator() {
  const { mutate, isLoading, data } = useGenerateData();

  return (
    <button onClick={() => mutate(30)} disabled={isLoading}>
      {isLoading ? 'Generating...' : 'Generate Data'}
    </button>
  );
}
```

### cURL

```bash
curl -X POST http://localhost:8080/api/tempsynth/generate \
  -H "Content-Type: application/json" \
  -d '{
    "days": 30,
    "region": "North America"
  }'
```

---

## Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| PORT | 8080 | No | Server port |
| NODE_ENV | development | No | Environment mode |
| LOG_LEVEL | info | No | Logging level |
| FRONTEND_URL | http://localhost:5173 | No | Frontend URL for CORS |
| DATABASE_URL | - | No | Database connection string |

---

## Error Handling

The API returns standard HTTP status codes:

- `200 OK` - Request successful
- `400 Bad Request` - Invalid input
- `404 Not Found` - Endpoint not found
- `500 Internal Server Error` - Server error

All errors include a JSON response with `error`, `message`, and `code` fields.

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider adding:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Performance

- Average response time: < 500ms
- Concurrent requests supported: Unlimited (depending on server resources)
- Data generation: ~5-10ms per day of data

---

## Monitoring & Logs

Logs are output via Pino logger in JSON format:

```json
{
  "level": 30,
  "time": "2024-07-09T13:10:00.000Z",
  "pid": 12345,
  "hostname": "server-name",
  "req": {
    "id": "req-id-123",
    "method": "POST",
    "url": "/api/tempsynth/generate"
  },
  "res": {
    "statusCode": 200
  }
}
```

Access logs in:
- **Development**: Console
- **Production (Render)**: Render dashboard > Logs tab
- **Vercel (if using serverless)**: Vercel dashboard > Function Logs

---

## Security

- CORS enabled for frontend domains
- Request body validation with Zod
- SQL injection prevention via Drizzle ORM parameterized queries
- No sensitive data in logs

---

## Support

For issues or questions:
1. Check Render/Vercel logs
2. Review error messages in API response
3. Check GitHub repository: https://github.com/Alokzhan/temp_agent

---

## Version

- **Current Version**: 1.0.0
- **Last Updated**: 2024-07-09
