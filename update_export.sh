cat << 'INNER_EOF' >> src/services/hypothesisCenterService.ts

  public exportAllHypothesesJson(isDemoFilter: 'ALL' | 'REAL' | 'DEMO' = 'ALL'): string {
    const data = {
      exportVersion: '1.0.0',
      applicationVersion: '30.0.0',
      generatedAt: new Date().toISOString(),
      filtres: {
        isDemo: isDemoFilter
      },
      provenance: 'OSINT_AFRICA_LOT30',
      questions: this.getGroups(isDemoFilter),
      hypotheses: this.getHypotheses(isDemoFilter),
      preuves: this.getEvidences(),
      evaluations: this.getAssessments(),
      criteres: this.getCriteria(),
      tests: this.getTests(),
      discriminants: this.getDiscriminants(),
      audit: this.getAuditLogs(isDemoFilter)
    };
    
    this.logAudit({
      analystId: 'USER',
      action: 'EXPORT_CREATED',
      entityId: 'ALL',
      reason: 'Export JSON manuel',
      isDemo: isDemoFilter === 'DEMO',
      provenance: 'SYSTEM'
    });
    
    return JSON.stringify(data, null, 2);
  }
}
INNER_EOF
sed -i 's/^}$//' src/services/hypothesisCenterService.ts
