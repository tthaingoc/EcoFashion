using EcoFashionBackEnd.Dtos.DesignDraft;
using EcoFashionBackEnd.Entities;

namespace EcoFashionBackEnd.Common.Payloads.Requests.DessignDraft
{
    public class DraftDesignCreateRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public float RecycledPercentage { get; set; }
        public int DesignTypeId { get; set; }
        //public DesignStage Stage { get; set; } = DesignStage.Draft;

        public string DraftPartsJson { get; set; } 

        public List<IFormFile> SketchImages { get; set; } = new();
    }
}

//[{ 
//    "name": "Thân áo", "length": 20, "width": 10, "quantity": 2, "materialId": 1, "materialStatus": 0 
//  },
//  {
//    "name": "Tay áo", "length": 20, "width": 20, "quantity": 1, "materialId": 2, "materialStatus": 0
//  }
//   ]