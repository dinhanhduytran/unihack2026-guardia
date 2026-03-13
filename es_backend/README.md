# Elasticsearch 9.3.1 Setup for SafeRoute Hackathon (Windows)

This guide sets up a **local Elasticsearch instance** for the SafeRoute project, ready for **geospatial queries**.  

---

## 1. Download Elasticsearch

Download from: [Elasticsearch 9.3.1 Windows](https://www.elastic.co/downloads/past-releases/elasticsearch-9-3-1)  

Save it to your project folder:


D:\AlternativeDownloads\hackathon\unihack2026-safeRoute\es_backend


---

## 2. Unzip

```powershell
Expand-Archive elasticsearch-9.3.1-windows-x86_64.zip

## 3. Configure Elasticsearch

Edit:

es_backend/elasticsearch-9.3.1/config/elasticsearch.yml

Add the following:

# Disable security for local hackathon dev
xpack.security.enabled: false

# Ignore disk usage checks to avoid RED cluster issues
cluster.routing.allocation.disk.threshold_enabled: false

# Network binding
network.host: 127.0.0.1

# Optional: change data directory if disk space issues
# path.data: D:/esdata
## 4. Reduce JVM Heap for Windows

Create a file:

es_backend/elasticsearch-9.3.1/config/jvm.options.d/heap.options

Content:

-Xms512m
-Xmx512m

Heap min/max must match. This avoids startup errors on low-memory machines.

## 5. Create Logs Folder
mkdir D:\AlternativeDownloads\hackathon\unihack2026-safeRoute\logs

## 6. Run Elasticsearch in Background

Go to the bin folder:

cd D:\AlternativeDownloads\hackathon\unihack2026-safeRoute\es_backend\elasticsearch-9.3.1\bin

Run:

Start-Process -FilePath ".\elasticsearch.bat" `
  -RedirectStandardOutput "..\logs\es.out.log" `
  -RedirectStandardError "..\logs\es.err.log" `
  -WindowStyle Hidden

This runs Elasticsearch in the background and logs output.

## 7. Verify Installation
curl http://127.0.0.1:9200

Expected output:

{
  "name": "DESKTOP-HLAHRRB",
  "cluster_name": "elasticsearch",
  "cluster_uuid": "...",
  "version": { "number": "9.3.1" },
  "tagline": "You Know, for Search"
}

Check cluster health:

curl http://127.0.0.1:9200/_cluster/health?pretty

Expected:

{
  "status": "yellow",
  "number_of_nodes": 1
}
8. Connect FastAPI Backend
from elasticsearch import Elasticsearch

es = Elasticsearch("http://127.0.0.1:9200")

# Example: ping the cluster
print(es.ping())  # should print True