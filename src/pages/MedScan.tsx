import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/PageTransition";

const MedScan = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [scanType, setScanType] = useState("");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeDocument = async () => {
    if (!selectedFile || !previewUrl) {
      toast({
        title: "No file selected",
        description: "Please upload a medical document first",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-medical-document", {
        body: { imageBase64: previewUrl },
      });

      if (error) throw error;
      setAnalysis(data.analysis);
      toast({
        title: "Analysis complete",
        description: "Medical document analyzed successfully",
      });
    } catch (error) {
      console.error("Error analyzing document:", error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-5">
          <div>
            <h1>Med Scan AI</h1>
            <p className="text-muted-foreground mt-1">
              Upload medical images and documents for AI-powered analysis
            </p>
          </div>

        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Upload Medical Document</CardTitle>
            <CardDescription>
              Drag your file here or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            {previewUrl && (
              <div className="mb-4">
                <img
                  src={previewUrl}
                  alt="Document preview"
                  className="max-h-64 mx-auto rounded-lg border"
                />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="default"
              size="lg"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-5 w-5" />
              {selectedFile ? "Change File" : "Select File"}
            </Button>
            {selectedFile && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {selectedFile.name}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              Supported formats: X-Ray, MRI, CT Scan, Lab Reports (PDF, JPG, PNG)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Document Information
            </CardTitle>
            <CardDescription>
              Add context to help AI provide better analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Input
                placeholder="e.g., X-Ray, Blood Test, MRI"
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                placeholder="Add any context about symptoms, concerns, or specific areas to focus on..."
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={!selectedFile || analyzing}
              onClick={analyzeDocument}
            >
              {analyzing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {analyzing ? "Analyzing..." : "Upload & Analyze"}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Analysis Results
              </CardTitle>
              <CardDescription>
                Detailed analysis of your medical document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {analysis}
              </div>
              <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm text-warning-foreground">
                  <strong>Important:</strong> This analysis is for informational purposes only.
                  Please consult with a healthcare professional for medical advice.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>Your previously analyzed medical documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No scans uploaded yet</p>
              <p className="text-sm mt-1">Upload your first medical scan to get started</p>
            </div>
          </CardContent>
        </Card>
      </div>
      </PageTransition>
  );
};

export default MedScan;