from backend.app.ai.tracker import MultiObjectTracker, compute_iou

def test_compute_iou():
    box1 = [0.0, 0.0, 10.0, 10.0]
    box2 = [0.0, 0.0, 10.0, 10.0]
    # Identical boxes => IoU = 1.0
    assert abs(compute_iou(box1, box2) - 1.0) < 1e-4

    box3 = [5.0, 0.0, 15.0, 10.0]
    # Overlapping 5x10 area => intersection=50, union=150 => 50/150 = 0.3333
    iou = compute_iou(box1, box3)
    assert abs(iou - (1.0 / 3.0)) < 1e-2

    box_disjoint = [20.0, 20.0, 30.0, 30.0]
    assert compute_iou(box1, box_disjoint) == 0.0

def test_tracker_lifecycle():
    tracker = MultiObjectTracker(max_misses=5, iou_threshold=0.2)

    # Frame 1: 1 detection
    dets_f1 = [{"bbox": [50.0, 50.0, 100.0, 150.0], "conf": 0.88}]
    tracks_f1 = tracker.update(dets_f1, current_time=1.0)
    assert len(tracks_f1) == 1
    t_id = tracks_f1[0]["track_id"]
    assert tracks_f1[0]["label"] == f"Person #{t_id}"

    # Frame 2: Person moves slightly right
    dets_f2 = [{"bbox": [55.0, 50.0, 105.0, 150.0], "conf": 0.91}]
    tracks_f2 = tracker.update(dets_f2, current_time=1.1)
    assert len(tracks_f2) == 1
    # Track ID must persist
    assert tracks_f2[0]["track_id"] == t_id
    assert tracks_f2[0]["dwell_time"] >= 0.09
