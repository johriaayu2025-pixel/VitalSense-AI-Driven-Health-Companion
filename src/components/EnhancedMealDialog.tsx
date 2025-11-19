import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Search, Star, Utensils, Loader2, Heart, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface EnhancedMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EnhancedMealDialog = ({ open, onOpenChange, onSuccess }: EnhancedMealDialogProps) => {
  const [activeTab, setActiveTab] = useState("manual");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [manualForm, setManualForm] = useState({
    name: "",
    mealType: "breakfast",
    quantity: "",
    measurement: "g"
  });

  const loadFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("favorite_meals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setFavorites(data || []);
  };

  const searchFoods = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("search-foods", {
        body: { query: searchQuery }
      });

      if (error) throw error;
      setSearchResults(data.foods || []);
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const logMeal = async (mealData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("meals").insert({
        user_id: user.id,
        name: mealData.name,
        meal_type: mealData.mealType || "snack",
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat,
        photo_url: mealData.photo_url,
        consumed_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${mealData.name} logged successfully`
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const nutritionQuery = `${manualForm.quantity}${manualForm.measurement} ${manualForm.name}`;
      
      const { data: nutritionData, error } = await supabase.functions.invoke("analyze-nutrition", {
        body: { query: nutritionQuery }
      });

      if (error) throw error;

      await logMeal({
        name: manualForm.name,
        mealType: manualForm.mealType,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat
      });

      setManualForm({ name: "", mealType: "breakfast", quantity: "", measurement: "g" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const analyzeAndLogPhoto = async () => {
    if (!selectedImage) return;
    setAnalyzingImage(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { imageBase64: selectedImage }
      });

      if (error) throw error;

      await logMeal({
        name: data.foodName || "Scanned food",
        mealType: "snack",
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        photo_url: selectedImage
      });

      setSelectedImage(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAnalyzingImage(false);
    }
  };

  const addToFavorites = async (meal: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("favorite_meals").insert({
        user_id: user.id,
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        meal_type: "snack",
        portion_description: meal.portion || meal.portionSize
      });

      if (error) throw error;

      toast({
        title: "Added to favorites",
        description: `${meal.name} saved to your favorites`
      });

      loadFavorites();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Log Your Meal</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="manual" className="gap-2">
              <Utensils className="h-4 w-4" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="photo" className="gap-2">
              <Camera className="h-4 w-4" />
              Photo
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2" onClick={loadFavorites}>
              <Star className="h-4 w-4" />
              Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <Label>Meal Type</Label>
                <Select value={manualForm.mealType} onValueChange={(value) => setManualForm({ ...manualForm, mealType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Food Item</Label>
                <Input
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  placeholder="e.g., Chicken salad, Brown rice"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    value={manualForm.quantity}
                    onChange={(e) => setManualForm({ ...manualForm, quantity: e.target.value })}
                    placeholder="1, 2, 100, 0.5"
                    required
                  />
                </div>
                <div>
                  <Label>Measurement</Label>
                  <Select value={manualForm.measurement} onValueChange={(value) => setManualForm({ ...manualForm, measurement: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="ml">Milliliters (ml)</SelectItem>
                      <SelectItem value="bowl">Bowl</SelectItem>
                      <SelectItem value="cup">Cup</SelectItem>
                      <SelectItem value="plate">Plate</SelectItem>
                      <SelectItem value="roti">Roti</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="slice">Slice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Meal
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="photo" className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedImage ? (
                <img src={selectedImage} alt="Food" className="max-h-64 mx-auto rounded-lg" />
              ) : (
                <div className="space-y-4">
                  <Upload className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-medium">Take Photo or Upload</p>
                    <p className="text-sm text-muted-foreground">Click to select an image</p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageUpload}
            />
            {selectedImage && (
              <Button onClick={analyzeAndLogPhoto} className="w-full" disabled={analyzingImage}>
                {analyzingImage && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Analyze & Log Meal
              </Button>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for foods..."
                onKeyDown={(e) => e.key === "Enter" && searchFoods()}
              />
              <Button onClick={searchFoods} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {searchResults.map((food, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{food.name}</h4>
                        <p className="text-sm text-muted-foreground">{food.portion}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span>{food.calories} cal</span>
                          <span>P: {food.protein}g</span>
                          <span>C: {food.carbs}g</span>
                          <span>F: {food.fat}g</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => addToFavorites(food)}>
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={() => logMeal({ ...food, mealType: "snack" })}>
                          Log
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="favorites">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {favorites.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No favorite meals yet</p>
                    <p className="text-sm">Add foods from search to your favorites</p>
                  </div>
                ) : (
                  favorites.map((food) => (
                    <Card key={food.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{food.name}</h4>
                          <p className="text-sm text-muted-foreground">{food.portion_description}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span>{food.calories} cal</span>
                            <span>P: {food.protein}g</span>
                            <span>C: {food.carbs}g</span>
                            <span>F: {food.fat}g</span>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => logMeal(food)}>
                          Log
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedMealDialog;
