#!/bin/bash

# .env 파일에서 환경 변수 읽기
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo ".env file not found"
    exit 1
fi

# nabijiyo kustomization.yaml 업데이트
cat > app-of-apps/overlays/nabijiyo/kustomization.yaml << YAMLEOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: ai-lounge
resources:
  - deployment.yaml
  - service.yaml
images:
  - name: nabijiyo
    newName: ${REGISTRY_URL}/ai-lounge/nabijiyo
    newTag: latest
YAMLEOF

echo "✓ nabijiyo kustomization.yaml updated with REGISTRY_URL=${REGISTRY_URL}"
